import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/button';

export interface ChoiceTag {
  ariaLabel?: string;
  label: string;
  name: string;
  value: string;
  group?: string;
}

export type ClearAllEventHandler = () => void;
export type DeleteEventHandler = (name: string, label: string, value: string, group?: string) => void;

export interface ChoiceTagsProps {
  choiceTags: ChoiceTag[];
  onClearAll?: ClearAllEventHandler;
  onDelete?: DeleteEventHandler;
}

export function ChoiceTags({ choiceTags, onClearAll, onDelete }: ChoiceTagsProps) {
  const { t } = useTranslation(['gcweb']);

  const handleOnDelete = (_event: unknown, choice: ChoiceTag) => {
    if (onDelete) onDelete(choice.name, choice.label, choice.value, choice.group);
  };
  const handleOnClearAll = () => {
    if (onClearAll) onClearAll();
  };
  return (
    <div id={`selected-${choiceTags[0]?.name}-wrapper`} className="flex flex-wrap gap-3">
      {choiceTags.map((choiceTag) => (
        <div
          key={choiceTag.value}
          className="inline-flex items-center justify-center rounded-sm border-2 border-gray-900 bg-blue-100 px-2 py-1 align-middle break-all text-gray-900"
        >
          <span>{choiceTag.group ? `${choiceTag.group} - ${choiceTag.label}` : choiceTag.label}</span>
          <button
            aria-label={t('gcweb:choice-tag.choice-tag-added-aria-label', {
              item: choiceTag.name,
              choice: choiceTag.group ? `${choiceTag.group} - ${choiceTag.label}` : choiceTag.label,
            })}
            onClick={(e) => handleOnDelete(e, choiceTag)}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} className="ml-1" />
          </button>
        </div>
      ))}
      {choiceTags.length > 1 && (
        <Button variant="primary" id="clear-all-button" onClick={() => handleOnClearAll()}>
          {t('gcweb:choice-tag.clear-all')}
        </Button>
      )}
    </div>
  );
}
