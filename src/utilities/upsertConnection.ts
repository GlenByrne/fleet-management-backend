const upsertConnection = <TName extends string>(
  name: TName,
  oldValue: string | undefined | null,
  newValue: string | undefined | null
):
  | false
  | Record<TName, { connect: { id: string } } | { disconnect: true }> => {
  // we need to mutate if we're changing the value or if going from set -> unset or unset -> set
  // NOTE: coerce to boolean because db is null and args are undefined
  const shouldModify = oldValue !== newValue || !!oldValue !== !!newValue;
  return (
    shouldModify &&
    ({
      [name]: newValue ? { connect: { id: newValue } } : { disconnect: true },
    } as never)
  );
};

export default upsertConnection;
