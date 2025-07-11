// Shared session management
export const sessions = new Map<string, number>();

// Shared user database
export const users = [
  {
    id: 1,
    username: "john",
    email: "john@example.com",
    password: "password123",
    name: "John Doe",
  },
  {
    id: 2,
    username: "jane",
    email: "jane@example.com",
    password: "password123",
    name: "Jane Smith",
  },
];

// Helper function to get user from session
export const getUserFromSession = (cookies: string | undefined) => {
  if (!cookies) return null;

  const sessionMatch = cookies.match(/session=([^;]+)/);
  if (!sessionMatch) return null;

  const sessionToken = sessionMatch[1];
  const userId = sessions.get(sessionToken);

  if (!userId) return null;

  return users.find((u) => u.id === userId) || null;
};
