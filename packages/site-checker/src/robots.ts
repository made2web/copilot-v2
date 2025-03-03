import axios from "axios";

interface RobotsCheckResult {
  hasRobotsTxt: boolean;
  robotsTxtUrl?: string;
  error?: string;
}

/**
 * Verifies if a site has a robots.txt file
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise<RobotsCheckResult> - Result of the check
 */
export async function checkRobotsTxt(
  domain: string,
): Promise<RobotsCheckResult> {
  try {
    const robotsTxtUrl = `https://${domain}/robots.txt`;
    const response = await axios.get(robotsTxtUrl);

    if (response.status === 200) {
      return {
        hasRobotsTxt: true,
        robotsTxtUrl,
      };
    }
    return {
      hasRobotsTxt: false,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        hasRobotsTxt: false,
      };
    }
    console.error("Error checking robots.txt:", error);
    return {
      hasRobotsTxt: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error while checking robots.txt",
    };
  }
}

// Function to check if JS files are blocked
export async function areJSFilesBlocked(domain: string): Promise<boolean> {
  try {
    const robotsTxtUrl = `https://${domain}/robots.txt`;
    const response = await axios.get(robotsTxtUrl);
    if (response.status === 200) {
      const robotsTxt = response.data;
      // Simple check for Disallow rules that block JS files
      const disallows = robotsTxt.split('\n').filter(line => line.startsWith('Disallow:'));
      for (const disallow of disallows) {
        if (disallow.toLowerCase().includes('.js')) {
          return true;
        }
      }
      return false;
    }
    return false;
  } catch (error) {
    console.error("Error checking if JS files are blocked in robots.txt:", error);
    return false;
  }
}

// Function to check if a specific path is blocked
export async function isPathBlocked(domain: string, path: string): Promise<boolean> {
  try {
    const robotsTxtUrl = `https://${domain}/robots.txt`;
    const response = await axios.get(robotsTxtUrl);
    if (response.status === 200) {
      const robotsTxt = response.data;
      const disallows = robotsTxt.split('\n').filter(line => line.startsWith('Disallow:'));
      for (const disallow of disallows) {
        const disallowedPath = disallow.split(':')[1].trim();
        if (disallowedPath === path) {
          return true;
        }
      }
      return false;
    }
    return false;
  } catch (error) {
    console.error("Error checking if path is blocked in robots.txt:", error);
    return false;
  }
}