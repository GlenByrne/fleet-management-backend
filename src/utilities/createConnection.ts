export const createConnection = <TName extends string>(
  name: TName,
  value: string | undefined | null
): false | Record<TName, { connect: { id: string } } | undefined> => {
  const shouldModify = value !== null;
  return (
    shouldModify &&
    ({
      [name]: value ? { connect: { id: value } } : undefined,
    } as never)
  );
};
