import type { Ref } from 'react';

interface ContextualAlertProps {
    message: string;
    type: 'info' | 'success' | 'error'; // TODO success and error needed?
    ref?: Ref<HTMLDivElement>;
    role?: 'alert' | 'status' | 'log';
    ariaLive?: 'assertive' | 'polite';
    ariaAtomic?: boolean;
    htmlMessage?: boolean;
    textSmall?: boolean;
}

const styles: Record<NonNullable<ContextualAlertProps['type']>, string> = {
    success: `border-green-600 bg-green-100`, //TODO needed?
    error: `border-red-800 bg-red-100`, //TODO needed?
    info: `border-sky-700 bg-sky-100`,
};

export function ContextualAlert({
    ref,
    message,
    type = 'info',
    role = 'alert',
    ariaLive = 'polite',
    ariaAtomic = true,
    htmlMessage = false, // false for plain text messages
    textSmall= false
}: ContextualAlertProps) {
    return (
        <>
            <div
                ref={ref}
                className={`${styles[type]} flex w-full items-center border-l-6 border-[#2572B4] p-2`}
                role={role}
                aria-live={ariaLive}
                aria-atomic={ariaAtomic}
                >
                <div
                    role="presentation"
                    className="bg-[rgba(37, 114, 180,1)] h-28 min-w-[36px] bg-[url('/info-icon.svg')] bg-size-[28px] bg-left-top bg-no-repeat"
                />
                <div className={`pl-2 ${textSmall ? 'text-sm' : 'text-base'}`}>
                    {(htmlMessage) ?
                        <div dangerouslySetInnerHTML={{ __html: message }} /> :
                        message
                    }
                </div>
            </div>
        </>
    );
}

