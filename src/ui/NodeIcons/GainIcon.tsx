export function GainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" color="#fff">
      {/* <!-- Knob body --> */}
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>

      {/* <!-- Pointer line --> */}
      <path d="M 16 16 L 16 4" stroke="currentColor" strokeWidth="2"/>

      {/* <!-- Arrowhead at the tip --> */}
      <path d="M 16 6 L 14.5 10 L 17.5 10 Z" stroke="currentColor"/>
    </svg>
  );
}