// Плашка российского госномера: белое поле, чёрная рамка,
// регион отделён вертикальной чертой. Фирменный элемент интерфейса.
export default function PlateChip({ value }: { value: string }) {
  const match = value.match(/^([АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2})(\d{2,3})$/);
  const main = match ? match[1] : value;
  const region = match ? match[2] : null;

  return (
    <span className="inline-flex items-stretch border-2 border-neutral-900 bg-white font-mono font-semibold leading-none tracking-wider text-neutral-900">
      <span className="px-2 py-1 text-sm">{main}</span>
      {region && (
        <span className="border-l-2 border-neutral-900 px-1.5 py-1 text-xs">
          {region}
        </span>
      )}
    </span>
  );
}
