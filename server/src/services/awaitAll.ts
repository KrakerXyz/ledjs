
export async function awaitAll<T>(iterator: AsyncGenerator<T>): Promise<T[]> {
   const a: T[] = [];
   for await (const i of iterator) {
      a.push(i);
   }
   return a;
}