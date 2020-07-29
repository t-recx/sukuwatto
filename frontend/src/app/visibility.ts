export enum Visibility {
    Everyone = 'e',
    RegisteredUsers = 'r',
    Followers = 'f',
    OwnUser = 'u',
}

export const VisibilityLabel = new Map<string, string>([
  [Visibility.Everyone, 'Everyone'],
  [Visibility.RegisteredUsers, 'Registered users'],
  [Visibility.Followers, 'Followers'],
  [Visibility.OwnUser, 'Just me'],
]);
