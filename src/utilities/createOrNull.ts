export default function createOrNull<TName extends string>(
  name: TName,
  value: string | undefined | null
): false | Record<TName, { create: { dueDate: Date } } | undefined> {
  const shouldModify = value !== null;
  return (
    shouldModify &&
    ({
      [name]: value ? { create: { dueDate: value } } : undefined,
    } as never)
  );
}
