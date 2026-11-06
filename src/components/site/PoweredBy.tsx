/** The Powered by Layerwise badge, shown at the end of the footer. */
export function PoweredBy() {
  return (
    <a
      href='https://layerwise.app'
      target='_blank'
      rel='noopener noreferrer'
      className='powered-by'
    >
      <img
        src='https://layerwise.app/powered-by.png'
        alt='Powered by Layerwise'
        width={174}
        height={28}
        loading='lazy'
      />
    </a>
  );
}
