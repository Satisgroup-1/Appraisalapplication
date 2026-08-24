import { cn } from '@/lib/utils';

type PrecisionLabelProps = {
  index: string;
  label: string;
  detail?: string;
  className?: string;
};

export function PrecisionLabel({ index, label, detail, className }: PrecisionLabelProps) {
  return (
    <span className={cn('precision-label', className)}>
      <i aria-hidden="true" />
      <span>{index}</span>
      <b>{label}</b>
      {detail ? <small>{detail}</small> : null}
    </span>
  );
}
