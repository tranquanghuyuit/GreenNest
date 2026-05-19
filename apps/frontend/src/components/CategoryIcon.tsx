export function CategoryIcon({ icon }: { icon: string }) {
  return <span className={`category-icon category-icon-${icon}`} aria-hidden="true" />;
}
