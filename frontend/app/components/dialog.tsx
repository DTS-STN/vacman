/**
 * This component extends the functionality of the Dialog primitive from Radix UI
 *
 * Example usage:
 * ```
 * <Dialog>
 *   <DialogTrigger>Open Dialog</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Dialog Description</DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter>
 *       <DialogClose>Close Dialog</DialogClose>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * @see {@link https://www.radix-ui.com/primitives/docs/components/dialog} for more details.
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type * as React from 'react';

import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { DialogContentProps, DialogTitleProps, DialogDescriptionProps, DialogOverlayProps } from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';

import { cn } from '~/utils/tailwind-utils';

type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;

// Delay to wait for dialog closing animation before restoring focus
const DIALOG_CLOSE_ANIMATION_DELAY = 100;

// Context to track the trigger element for focus management
interface DialogContextType {
  triggerRef: React.RefObject<HTMLElement | null> | null;
  setTriggerRef: (ref: React.RefObject<HTMLElement | null>) => void;
  externalTriggerRef?: React.RefObject<HTMLElement | null>;
}

const DialogContext = createContext<DialogContextType>({
  triggerRef: null,
  setTriggerRef: () => {},
});

interface DialogProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
  /**
   * Optional ref to the element that triggered the dialog.
   * Use this when the dialog is controlled and not using DialogTrigger component.
   */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

// Enhanced Dialog root that manages focus restoration
export function Dialog({ children, open, onOpenChange, triggerRef: externalTriggerRef, ...props }: DialogProps) {
  const [triggerRef, setTriggerRef] = useState<React.RefObject<HTMLElement | null> | null>(null);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    // When dialog closes, restore focus to trigger element
    // Prefer internal trigger (from DialogTrigger) over external triggerRef prop
    const targetRef = triggerRef ?? externalTriggerRef;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (wasOpenRef.current && open === false && targetRef?.current) {
      // Delay to allow dialog closing animation to complete
      timeoutId = setTimeout(() => {
        targetRef.current?.focus();
      }, DIALOG_CLOSE_ANIMATION_DELAY);
    }

    wasOpenRef.current = open;

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open, triggerRef, externalTriggerRef]);

  return (
    <DialogContext.Provider value={{ triggerRef, setTriggerRef, externalTriggerRef }}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
        {children}
      </DialogPrimitive.Root>
    </DialogContext.Provider>
  );
}

// Enhanced DialogTrigger that registers itself for focus management
export function DialogTrigger({ children, onClick, ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { setTriggerRef } = useContext(DialogContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTriggerRef(triggerRef);
    onClick?.(e);
  };

  return (
    <DialogPrimitive.Trigger ref={triggerRef} onClick={handleClick} {...props}>
      {children}
    </DialogPrimitive.Trigger>
  );
}

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const { t } = useTranslation(['gcweb']);
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-white data-[state=open]:text-black">
          <FontAwesomeIcon icon={faXmark} className="block size-4" />
          <span className="sr-only">{t('gcweb:dialog.close')}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: HTMLDivProps) {
  return <div className={cn('flex flex-col space-y-1.5 sm:text-left', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLDivProps) {
  return <div className={cn('flex flex-wrap-reverse justify-end gap-2', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn('font-lato text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <DialogPrimitive.Description className={cn('text-sm text-neutral-500', className)} {...props} />;
}

export { DialogPortal, DialogClose };
