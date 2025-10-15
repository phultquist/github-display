import { NextRequest, NextResponse } from "next/server";

// Device ID to username mapping
const deviceIdToUsername: Record<string, string> = {
  "1": "phultquist",
  // Add more mappings as needed
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params promise
  const { id } = await params;

  // Map device ID to username
  const username = deviceIdToUsername[id];

  if (!username) {
    return NextResponse.json({ error: "Device ID not found" }, { status: 404 });
  }

  try {
    // Fetch GitHub contribution data using GitHub GraphQL API
    const query = `
      query($userName: String!) {
        user(login: $userName) {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const variables = { userName: username };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "github-display-server",
    };

    // Add GitHub token if available
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub data" },
        { status: response.status }
      );
    }

    const { data } = await response.json();

    if (!data || !data.user) {
      return NextResponse.json(
        { error: "User not found or no contribution data available" },
        { status: 404 }
      );
    }

    const weeks = data.user.contributionsCollection.contributionCalendar.weeks;

    // Initialize a 7x32x3 array (7 days, 32 weeks, 3 RGB values)
    const contributionArray: number[][][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 32 }, () => [0, 0, 0])
    );

    // Fill the array with contribution data
    let dayIndex = 0;
    for (const week of weeks) {
      for (const day of week.contributionDays) {
        const weekIndex = Math.floor(dayIndex / 7);
        const dayOfWeek = dayIndex % 7;
        if (weekIndex < 32) {
          // Scale contribution count to 0-255 range
          // GitHub typically shows max ~20 contributions per day, so scale accordingly
          const scaledValue = Math.min(
            255,
            Math.floor((day.contributionCount / 20) * 255)
          );
          // Convert single value to RGB array [R, G, B]
          contributionArray[dayOfWeek][weekIndex] = [
            scaledValue,
            scaledValue,
            scaledValue,
          ];
        }
        dayIndex++;
      }
    }

    // Add an 8th row of zeros to make it 8x32x3
    contributionArray.push(Array.from({ length: 32 }, () => [0, 0, 0]));

    return NextResponse.json({
      id: id,
      username: username,
      data: contributionArray,
    });
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
