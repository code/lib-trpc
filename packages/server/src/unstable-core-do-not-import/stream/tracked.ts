const trackedSymbol = Symbol('TrackedEnvelope');

type TrackedId = string & {
  __brand: 'TrackedId';
};
export type TrackedEnvelope<TData> = [TrackedId, TData, typeof trackedSymbol];

type Tracked<TData> = {
  /**
   * The id of the message to keep track of in case the connection gets lost
   */
  id: string;
  /**
   * The data field of the message - this can be anything
   */
  data: TData;
};
/**
 * Produce a typed server-sent event message
 * @deprecated use `tracked(id, data)` instead
 */
export function sse<TData>(event: {
  id: string;
  data: TData;
}): TrackedEnvelope<TData> {
  if (event.id === '') {
    // This could be removed by using different event names for `yield sse(x)`-emitted events and `yield y`-emitted events
    throw new Error(
      '`id` must not be an empty string as empty string is the same as not setting the id at all',
    );
  }
  return [event.id as TrackedId, event.data, trackedSymbol];
}

export function isTrackedEnvelope<TData>(
  value: unknown,
): value is TrackedEnvelope<TData> {
  return Array.isArray(value) && value[2] === trackedSymbol;
}

/**
 * Automatically track an event so that it can be resumed from a given id if the connection is lost
 */
export function tracked<TData>(
  id: string,
  data: TData,
): TrackedEnvelope<TData> {
  if (id === '') {
    // This limitation could be removed by using different SSE event names / channels for tracked event and non-tracked event
    throw new Error(
      '`id` must not be an empty string as empty string is the same as not setting the id at all',
    );
  }
  return [id as TrackedId, data, trackedSymbol];
}

export type inferTrackedOutput<TData> = TData extends TrackedEnvelope<
  infer $Data
>
  ? Tracked<$Data>
  : TData;