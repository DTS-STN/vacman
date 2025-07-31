import { useState } from 'react';
import type { Dispatch, JSX, SetStateAction } from 'react';

import { faChevronDown, faEye, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { Button } from './button';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '~/components/dropdown-menu';
import { Menu, MenuItem } from '~/components/menu';
import { cn } from '~/utils/tailwind-utils';

type AppBarProps = {
  children: React.ReactNode;
  name?: string;
  profileItems?: React.ReactNode;
  viewingAsRole: string;
  setViewingAsRole: Dispatch<SetStateAction<string>>;
};

export function AppBar({ children, name, profileItems, viewingAsRole, setViewingAsRole }: AppBarProps): JSX.Element {
  return (
    <div className="bg-slate-700">
      <div className="align-center container mx-auto flex flex-wrap justify-between">
        <div className="align-center flex">
          <Menu>{children}</Menu>
        </div>
        <div className="flex items-center space-x-4 text-right">
          <ViewingAsDropDown viewingAsRole={viewingAsRole} setViewingAsRole={setViewingAsRole} />
          {name && <UserButton name={name}>{profileItems}</UserButton>}
        </div>
      </div>
    </div>
  );
}

type ViewingAsDropDownProps = {
  viewingAsRole: string;
  setViewingAsRole: Dispatch<SetStateAction<string>>;
};

function ViewingAsDropDown({ viewingAsRole, setViewingAsRole }: ViewingAsDropDownProps): JSX.Element {
  const { t } = useTranslation(['gcweb']);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const handleRoleClick = (role: string) => {
    if (role === viewingAsRole) return;
    setPendingRole(role);
    setShowConfirmation(true);
  };

  const confirmRoleChange = () => {
    if (pendingRole) setViewingAsRole(pendingRole);
    setShowConfirmation(false);
    setPendingRole(null);
  };

  const cancelRoleChange = () => {
    setShowConfirmation(false);
    setPendingRole(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'flex h-full flex-nowrap space-x-2 bg-slate-600 px-2 text-sm text-white hover:bg-slate-500 hover:underline focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-hidden aria-expanded:bg-slate-800 aria-expanded:text-white sm:space-x-4 sm:px-4',
          )}
        >
          <span className="text-md my-auto flex flex-nowrap items-center space-x-2 py-2 font-bold">
            <FontAwesomeIcon icon={faEye} size="2xl" className="size-5 text-white" />
            <span className="text-md hidden py-2 sm:block">
              {t('gcweb:app.viewing-as')}:{' '}
              {viewingAsRole === 'employee' ? t('gcweb:app.employee') : t('gcweb:app.hiring-manager')}
            </span>
          </span>
          <FontAwesomeIcon icon={faChevronDown} className="my-auto size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-slate-700">
          <MenuItem onClick={() => handleRoleClick('employee')} file="routes/index.tsx">
            {t('gcweb:app.employee')}
          </MenuItem>
          <MenuItem onClick={() => handleRoleClick('hiring-manager')} file="routes/index.tsx">
            {t('gcweb:app.hiring-manager')}
          </MenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('gcweb:app.confirm-role-change')}</DialogTitle>
              <DialogDescription>
                {t('gcweb:app.confirm-role-change-message', {
                  current: viewingAsRole === 'employee' ? t('gcweb:app.employee') : t('gcweb:app.hiring-manager'),
                  new: pendingRole === 'employee' ? t('gcweb:app.employee') : t('gcweb:app.hiring-manager'),
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={cancelRoleChange}>{t('gcweb:app.cancel')}</Button>
              <Button variant="primary" onClick={confirmRoleChange}>
                {t('gcweb:app.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

type UserButtonProps = {
  className?: string;
  children?: React.ReactNode;
  name?: string;
};

function UserButton({ className, children, name }: UserButtonProps): JSX.Element {
  const { t } = useTranslation(['gcweb']);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex h-full flex-nowrap space-x-2 bg-slate-600 px-2 text-sm text-white hover:bg-slate-500 hover:underline focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-hidden aria-expanded:bg-slate-800 aria-expanded:text-white sm:space-x-4 sm:px-4',
          className,
        )}
      >
        <span className="text-md my-auto flex flex-nowrap items-center space-x-2 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <FontAwesomeIcon icon={faUser} className="size-5 text-slate-700" />
          </span>
          <span id="app-bar-menu-label" className="text-md hidden py-2 font-bold sm:block">
            {name}
          </span>
        </span>
        <FontAwesomeIcon icon={faChevronDown} className="my-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-slate-700">
        <UserName name={name} />
        <MenuItem file="routes/index.tsx">{t('gcweb:app.profile')}</MenuItem>
        {children}
        <MenuItem to="/auth/logout" className="text-md flex justify-between">
          {t('gcweb:app.logout')}
          <FontAwesomeIcon icon={faRightFromBracket} className="my-auto size-8" />
        </MenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type UserNameProps = {
  name?: string;
};

function UserName({ name }: UserNameProps): JSX.Element {
  return (
    <>
      {name !== undefined && (
        <DropdownMenuLabel className="text-md flex items-center border-b-2 border-slate-600 px-3 py-2 text-gray-300 sm:hidden">
          <FontAwesomeIcon icon={faUser} className="mr-2 size-4" />
          {name}
        </DropdownMenuLabel>
      )}
    </>
  );
}
