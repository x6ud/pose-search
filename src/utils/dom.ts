export function isElementInViewport(el: Element) {
    const rect = el.getBoundingClientRect(),
        width = rect.right - rect.left,
        height = rect.bottom - rect.top;
    return (
        rect.top > -height &&
        rect.left > -width &&
        rect.bottom < (window.innerHeight || document.documentElement.clientHeight) + height &&
        rect.right < (window.innerWidth || document.documentElement.clientWidth) + width
    );
}

/**
 * Allow mouse dragging outside the dragged element.
 * @param immediatelyTriggerEvent If not null, immediately trigger drag move event when called
 * @param onDragMove
 * @param onDragEnd
 */
export function addGlobalDragListener(
    immediatelyTriggerEvent: MouseEvent | null,
    onDragMove: (e: MouseEvent) => void,
    onDragEnd?: (e: MouseEvent) => void
) {
    let onMouseUp: (e: MouseEvent) => void;
    let onMouseOutOfWindow: (e: MouseEvent) => void;
    let _onDragMove = (e: MouseEvent) => {
        return onDragMove(e);
    };
    let _onDragEnd = (e: MouseEvent) => {
        document.removeEventListener('mousemove', _onDragMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mouseout', onMouseOutOfWindow);
        return onDragEnd && onDragEnd(e);
    };
    onMouseUp = _onDragEnd;
    onMouseOutOfWindow = (e: MouseEvent) => {
        if (!e.relatedTarget || ((e.relatedTarget as HTMLElement).nodeName === 'HTML')) {
            _onDragEnd(e);
        }
    };

    document.addEventListener('mousemove', _onDragMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseout', onMouseOutOfWindow);

    if (immediatelyTriggerEvent) {
        _onDragMove(immediatelyTriggerEvent);
    }
}
