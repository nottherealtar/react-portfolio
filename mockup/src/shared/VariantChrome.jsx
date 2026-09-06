export function VariantChrome({ id, name }) {
  return (
    <a className="variant-chrome" href={`${import.meta.env.BASE_URL}`} aria-label="Back to variant lab">
      <span>Lab</span>
      <strong>{name}</strong>
    </a>
  )
}
