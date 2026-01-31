interface Named {
  name: string;
}

export const sortByName = <T extends Named>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export const firstByName = <T extends Named>(items: T[]) =>
  sortByName(items)[0];
