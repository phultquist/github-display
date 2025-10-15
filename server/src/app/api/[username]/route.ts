import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  // Await the params promise
  const { username } = await params;

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

    // Initialize a 7x32 array
    const contributionArray: number[][] = Array.from({ length: 7 }, () =>
      Array(32).fill(0)
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
          contributionArray[dayOfWeek][weekIndex] = scaledValue;
        }
        dayIndex++;
      }
    }

    // Add an 8th row of zeros to make it 8x32
    contributionArray.push(Array(32).fill(0));

    return NextResponse.json({
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
