import React, { FC, useRef, useEffect, useCallback, useState } from 'react';
import * as styled from './ScrollBar.styled';
const SCROLL_BOX_MIN_HEIGHT = 20;
interface Props {
    showVerticalScrollIndicator?: boolean;
    children: React.ReactNode;
}
const ScrollBar: FC<Props> = ({ children, showVerticalScrollIndicator = true, ...restProps }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hovering, setHovering] = useState<boolean>(false);
    const [scrollBoxHeight, setScrollBoxHeight] = useState<number>(SCROLL_BOX_MIN_HEIGHT);
    const [scrollBoxTop, setScrollBoxTop] = useState<number>(0);
    const [lastScrollThumbPosition, setScrollThumbPosition] = useState<number>(0);
    const [isDragging, setDragging] = useState<boolean>(false);

    const handleMouseOver = useCallback(() => {
        const scrollHostElement = scrollRef.current;
        const { clientHeight, scrollHeight } = scrollHostElement;
        if (clientHeight !== scrollHeight) {
            !hovering && setHovering(true);
        }
    }, [hovering]);

    const handleMouseOut = useCallback(() => hovering && setHovering(false), [hovering]);

    const handleDocumentMouseUp = useCallback(
        e => {
            if (isDragging) {
                e.preventDefault();
                setDragging(false);
            }
        },
        [isDragging]
    );
    const handleScrollThumbMouseDown = useCallback(e => {
        e.preventDefault();
        e.stopPropagation();
        setScrollThumbPosition(e.clientY);
        setDragging(true);
    }, []);
    const handleDocumentMouseMove = useCallback(
        e => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                const scrollHostElement = scrollRef.current;
                const { scrollHeight, offsetHeight } = scrollHostElement;
                const deltaY = e.clientY - lastScrollThumbPosition;
                const percentage = deltaY * (scrollHeight / offsetHeight);
                setScrollThumbPosition(e.clientY);
                setScrollBoxTop(Math.min(Math.max(0, scrollBoxTop + deltaY), offsetHeight - scrollBoxHeight));
                scrollHostElement.scrollTop = Math.min(scrollHostElement.scrollTop + percentage, scrollHeight - offsetHeight);
            }
        },
        [isDragging, lastScrollThumbPosition, scrollBoxHeight, scrollBoxTop]
    );
    const handleScroll = useCallback(() => {
        if (!scrollRef) return;
        const scrollHostElement = scrollRef.current;
        const { scrollTop, scrollHeight, offsetHeight } = scrollHostElement;
        let newTop = (scrollTop / scrollHeight) * offsetHeight;
        newTop = Math.min(newTop, offsetHeight - scrollBoxHeight);
        setScrollBoxTop(newTop);
    }, []);

    useEffect(() => {
        const scrollHostElement = scrollRef.current;
        const { clientHeight, scrollHeight } = scrollHostElement;
        const scrollThumbPercentage = clientHeight / scrollHeight;
        const scrollThumbHeight = Math.max(scrollThumbPercentage * clientHeight, SCROLL_BOX_MIN_HEIGHT);
        setScrollBoxHeight(scrollThumbHeight);
        scrollHostElement.addEventListener('scroll', handleScroll, true);
        return () => scrollHostElement.removeEventListener('scroll', handleScroll, true);
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleDocumentMouseMove);
        document.addEventListener('mouseup', handleDocumentMouseUp);
        document.addEventListener('mouseleave', handleDocumentMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleDocumentMouseMove);
            document.removeEventListener('mouseup', handleDocumentMouseUp);
            document.removeEventListener('mouseleave', handleDocumentMouseUp);
        };
    }, [handleDocumentMouseMove, handleDocumentMouseUp]);
    return (
        <styled.Container onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <styled.SubContainer ref={scrollRef} {...restProps}>
                {children}
            </styled.SubContainer>
            <styled.ScrollBarContainer hovering={hovering}>
                <styled.ScrollThumb style={{ height: scrollBoxHeight, top: scrollBoxTop }} onMouseDown={handleScrollThumbMouseDown} />
            </styled.ScrollBarContainer>
        </styled.Container>
    );
};

export default ScrollBar;
