const CATEGORIES = ["text", "radius", "spacing"];
const CATEGORY_PREFIXES = {
  text: "--text-",
  radius: "--radius-",
  spacing: "--spacing-",
};
const LEADING_DIGIT_TOKEN = /^\d/;

const DEFAULT_SCALE_TOKENS = {
  text: new Set([
    "xs",
    "sm",
    "base",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "5xl",
    "6xl",
    "7xl",
    "8xl",
    "9xl",
  ]),
  radius: new Set(["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "full"]),
  spacing: new Set([
    "px",
    "0",
    "0.5",
    "1",
    "1.5",
    "2",
    "2.5",
    "3",
    "3.5",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "14",
    "16",
    "20",
    "24",
    "28",
    "32",
    "36",
    "40",
    "44",
    "48",
    "52",
    "56",
    "60",
    "64",
    "72",
    "80",
    "96",
    "1/2",
    "1/3",
    "2/3",
    "1/4",
    "2/4",
    "3/4",
    "full",
  ]),
};

function extractBlock(source, openIndex) {
  if (source[openIndex] !== "{") {
    throw new Error("Expected object opening brace.");
  }

  let depth = 0;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          block: source.slice(openIndex + 1, i),
          end: i,
        };
      }
    }
  }

  return null;
}

export function parseThemeTokens(fileContents, sourceLabel) {
  const themeMatches = [...fileContents.matchAll(/@theme\b/g)];
  if (themeMatches.length === 0) {
    throw new Error(`Could not find an \`@theme\` block in ${sourceLabel}`);
  }
  const found = {
    text: new Set(),
    radius: new Set(),
    spacing: new Set(),
  };

  for (const themeMatch of themeMatches) {
    const themeOpenIndex = themeMatch.index;
    const firstBraceIndex = fileContents.indexOf("{", themeOpenIndex);
    if (firstBraceIndex === -1) {
      throw new Error(`Malformed \`@theme\` block in ${sourceLabel}`);
    }

    const themeExtract = extractBlock(fileContents, firstBraceIndex);
    if (!themeExtract) {
      throw new Error(`Unterminated \`@theme\` block in ${sourceLabel}`);
    }

    const variablePattern = /--([a-z0-9-]+)\s*:/gi;
    for (const match of themeExtract.block.matchAll(variablePattern)) {
      const token = match[1];
      if (token.includes("*")) {
        continue;
      }

      for (const category of CATEGORIES) {
        const prefix = CATEGORY_PREFIXES[category];
        if (token.startsWith(prefix.slice(2))) {
          const name = token.slice(prefix.length - 2);
          if (!name.includes("--")) {
            found[category].add(name);
          }
        }
      }
    }
  }

  return found;
}

export function mergeThemeTokens(...parts) {
  const merged = {
    text: new Set(),
    radius: new Set(),
    spacing: new Set(),
  };
  for (const part of parts) {
    for (const category of CATEGORIES) {
      for (const token of part[category]) {
        merged[category].add(token);
      }
    }
  }
  return merged;
}

export function parseClassTokens(fileContents, category) {
  const extendIndex = fileContents.indexOf("extend:");
  if (extendIndex === -1) {
    throw new Error(
      "Could not find tailwind merge `extend` block in src/lib/classes.ts"
    );
  }

  const themeIndex = fileContents.indexOf("theme:", extendIndex);
  if (themeIndex === -1) {
    throw new Error(
      "Could not find tailwind merge theme section in src/lib/classes.ts"
    );
  }

  const themeOpen = fileContents.indexOf("{", themeIndex);
  if (themeOpen === -1) {
    throw new Error(
      "Could not find tailwind merge theme object in src/lib/classes.ts"
    );
  }

  const themeExtract = extractBlock(fileContents, themeOpen);
  if (!themeExtract) {
    throw new Error(
      "Could not parse tailwind merge theme block in src/lib/classes.ts"
    );
  }

  const categoryMatch = themeExtract.block.match(
    new RegExp(`${category}\\s*:\\s*\\[([\\s\\S]*?)\\]`, "m")
  );

  if (!categoryMatch) {
    throw new Error(
      `Could not find tailwind merge "${category}" tokens in src/lib/classes.ts`
    );
  }

  const tokens = new Set();
  for (const match of categoryMatch[1].matchAll(/["']([^"'`]+)["']/g)) {
    tokens.add(match[1]);
  }

  return tokens;
}

function diff(actual, expected) {
  return Array.from(actual)
    .filter((item) => !expected.has(item))
    .sort();
}

function isTailwindScaleToken(category, token) {
  if (DEFAULT_SCALE_TOKENS[category].has(token)) {
    return true;
  }

  return category === "spacing" && LEADING_DIGIT_TOKEN.test(token);
}

export function compareThemeAndClassTokens(themeTokens, classTokens) {
  const problems = [];

  for (const category of CATEGORIES) {
    const missingInClasses = diff(themeTokens[category], classTokens[category]);
    const extraInClasses = diff(classTokens[category], themeTokens[category]);
    const requiredMissingInClasses = missingInClasses.filter(
      (token) => !isTailwindScaleToken(category, token)
    );

    if (requiredMissingInClasses.length > 0) {
      problems.push({
        category,
        direction: "missing-in-classes",
        tokens: requiredMissingInClasses,
      });
    }

    if (extraInClasses.length > 0) {
      problems.push({
        category,
        direction: "extra-in-classes",
        tokens: extraInClasses,
      });
    }
  }

  return {
    ok: problems.length === 0,
    problems,
    summary: CATEGORIES.map(
      (category) =>
        `${category}:${themeTokens[category].size}/${classTokens[category].size}`
    ).join(" "),
  };
}

export function formatThemeAndClassComparison(result) {
  if (result.ok) {
    return [
      `✅ Theme/class merge map is aligned: ${CATEGORIES.map((category) => `${category}=${result.summary.match(new RegExp(`${category}:(\\d+)/`))[1]}`).join(", ")}`,
    ];
  }

  const lines = [];
  for (const problem of result.problems) {
    if (problem.direction === "missing-in-classes") {
      lines.push(
        `\n❌ ${problem.category} tokens in theme CSS (semantic-tokens + tailwind-aliases) not in src/lib/classes.ts`
      );
    } else {
      lines.push(
        `\n❌ ${problem.category} tokens in src/lib/classes.ts not in theme CSS (semantic-tokens + tailwind-aliases)`
      );
    }
    lines.push(
      `   ${problem.tokens.map((token) => `--${problem.category}-${token}`).join(", ")}`
    );
  }
  lines.push(`\nSummary: ${result.summary}`);
  return lines;
}

export function getAlignedCounts(themeTokens) {
  return CATEGORIES.map((category) => themeTokens[category].size);
}

export { CATEGORIES };
