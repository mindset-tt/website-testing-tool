export const EXIT_PASSED = 0;
export const EXIT_FAILED_OR_ERROR = 1;
export const EXIT_INVALID_USAGE = 2;

export function runStatusToExitCode(status: 'passed' | 'failed' | 'error'): number {
  if (status === 'passed') {
    return EXIT_PASSED;
  }

  return EXIT_FAILED_OR_ERROR;
}
