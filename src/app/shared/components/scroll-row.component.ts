import { Component, ChangeDetectionStrategy, Input, ElementRef, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scroll-row-wrapper">
      @if (showLeft()) {
        <button
          class="scroll-arrow scroll-arrow-left"
          (click)="scrollLeft()"
          aria-label="Scroll left"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      }

      <div
        class="scroll-row"
        #scrollContainer
        (scroll)="onScroll()"
        role="list"
      >
        <ng-content />
      </div>

      @if (showRight()) {
        <button
          class="scroll-arrow scroll-arrow-right"
          (click)="scrollRight()"
          aria-label="Scroll right"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    .scroll-row-wrapper {
      position: relative;
    }
    .scroll-row {
      display: flex;
      gap: var(--space-md);
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: var(--space-xs) 0;
    }
    .scroll-row::-webkit-scrollbar {
      display: none;
    }
    .scroll-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      color: var(--text-secondary);
      width: 40px;
      height: 40px;
      min-height: 40px;
      min-width: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      box-shadow: var(--shadow-md);
      transition: color 0.2s, background-color 0.2s, border-color 0.2s;
    }
    .scroll-arrow:hover {
      color: var(--accent-primary);
      border-color: var(--accent-primary);
      background-color: var(--bg-raised);
    }
    .scroll-arrow-left {
      left: -16px;
    }
    .scroll-arrow-right {
      right: -16px;
    }
    @media (max-width: 768px) {
      .scroll-arrow { display: none; }
      .scroll-row {
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
      }
      .scroll-row ::ng-deep > * {
        scroll-snap-align: start;
      }
    }
  `],
})
export class ScrollRowComponent {
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef<HTMLElement>;

  readonly showLeft = signal(false);
  readonly showRight = signal(true);

  private get el(): HTMLElement {
    return this.scrollContainer.nativeElement;
  }

  scrollLeft(): void {
    this.el.scrollBy({ left: -this.scrollAmount(), behavior: 'smooth' });
  }

  scrollRight(): void {
    this.el.scrollBy({ left: this.scrollAmount(), behavior: 'smooth' });
  }

  onScroll(): void {
    const { scrollLeft, scrollWidth, clientWidth } = this.el;
    this.showLeft.set(scrollLeft > 4);
    this.showRight.set(scrollLeft + clientWidth < scrollWidth - 4);
  }

  private scrollAmount(): number {
    return this.el.clientWidth * 0.75;
  }
}
