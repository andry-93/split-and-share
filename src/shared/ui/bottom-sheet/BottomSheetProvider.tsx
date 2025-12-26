import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';
import { BottomSheet } from './BottomSheet';
import { SnapPoint } from './types';

type ShowOptions = {
    snap?: SnapPoint;
};

type ContextValue = {
    show: (
        content: ReactNode,
        options?: ShowOptions
    ) => void;
    hide: () => void;
};

const BottomSheetContext =
    createContext<ContextValue | null>(null);

export const BottomSheetProvider = ({
                                        children,
                                    }: {
    children: ReactNode;
}) => {
    const [content, setContent] =
        useState<ReactNode | null>(null);
    const [visible, setVisible] =
        useState(false);
    const [snap, setSnap] =
        useState<SnapPoint>('medium');

    /**
     * 🔒 блокируем повторное открытие,
     * пока sheet не закрыт полностью
     */
    const busyRef = useRef(false);

    const show = useCallback(
        (
            nextContent: ReactNode,
            options?: ShowOptions
        ) => {
            if (busyRef.current) return;

            busyRef.current = true;
            setSnap(options?.snap ?? 'medium');
            setContent(nextContent);
            setVisible(true);
        },
        []
    );

    const hide = useCallback(() => {
        if (!visible) return;
        setVisible(false);
    }, [visible]);

    return (
        <BottomSheetContext.Provider
            value={{ show, hide }}
        >
            {children}

            {/* 🔥 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ */}
            {visible && (
                <BottomSheet
                    visible
                    snap={snap}
                    onDismiss={hide}
                    onClosed={() => {
                        busyRef.current = false;
                        setContent(null);
                    }}
                >
                    {content}
                </BottomSheet>
            )}
        </BottomSheetContext.Provider>
    );
};

export const useBottomSheet = () => {
    const ctx = useContext(BottomSheetContext);
    if (!ctx) {
        throw new Error(
            'useBottomSheet must be used inside BottomSheetProvider'
        );
    }
    return ctx;
};
