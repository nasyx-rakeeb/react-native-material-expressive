/**
 * Resolve the extensionless internal imports used by
 * `@material/material-color-utilities@0.4.0` when running it directly in Node.
 * The package ships ESM without file extensions, which plain Node rejects.
 */
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !/\.[cm]?js$/.test(specifier)
    ) {
      return next(`${specifier}.js`, context);
    }
    throw error;
  }
}
