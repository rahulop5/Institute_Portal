export function getSlotStart(slot) {
  const isoDate = new Date(slot.date).toISOString().slice(0, 10);
  return new Date(`${isoDate}T${slot.startTime}:00`);
}

export function isSlotInPast(slot) {
  return getSlotStart(slot).getTime() <= Date.now();
}
