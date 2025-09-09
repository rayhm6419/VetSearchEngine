export type User = {
  id: string;
  email: string;
  username: string;
  createdAt: string; // ISO
};

// In-memory mock DB (resets on server restart)
export const users: User[] = [
  { id: "u_1", email: "demo@example.com", username: "demo_user", createdAt: new Date().toISOString() },
];

export const findUserByEmail = (email: string) =>
  users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;

export const findUserByUsername = (username: string) =>
  users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;

export const isValidUsername = (username: string) => /^[A-Za-z0-9_]{3,20}$/.test(username);

export const addUser = (email: string, username: string): User => {
  const existingEmail = findUserByEmail(email);
  if (existingEmail) return existingEmail;
  const user: User = {
    id: `u_${users.length + 1}`,
    email,
    username,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
};


