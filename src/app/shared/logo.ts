import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="#fff" />
      <rect x="12" y="40" width="40" height="8" rx="3" fill="#2f6fdb" />
      <rect x="16" y="24" width="32" height="18" rx="3" fill="#e8412c" />
      <rect x="12" y="18" width="9" height="26" rx="4" fill="#3db34a" />
      <rect x="43" y="18" width="9" height="26" rx="4" fill="#3db34a" />
      <path d="M11 19 L16.5 9 L22 19 Z" fill="#f6c026" />
      <path d="M42 19 L47.5 9 L53 19 Z" fill="#f6c026" />
      <path d="M26 25 Q32 14 38 25 Z" fill="#f6c026" />
      <rect x="26" y="30" width="12" height="11" rx="6" fill="#fff" opacity=".8" />
    </svg>
  `,
  styles: `:host { display: inline-block; width: 44px; height: 44px; } svg { width: 100%; height: 100%; }`,
})
export class Logo {}
