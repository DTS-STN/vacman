import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

export interface ChoiceTag {
  ariaLabel?: string;
  label: string;
  name: string;
  value: string;
}
//TODO: add clear all event handler
export type DeleteEventHandler = (name: string, label: string, value: string) => void;

export interface ChoiceTagsProps {
  choiceTags: ChoiceTag[];
  onDelete?: (name: string, label: string, value: string) => void;
}

export function ChoiceTags({ choiceTags, onDelete }: ChoiceTagsProps) {
  const { t } = useTranslation(['gcweb']);

  const handleOnDelete = (_event: unknown, choice: ChoiceTag) => {
    if (onDelete) onDelete(choice.name, choice.label, choice.value);
  };

  return (
    <div id="selected-classifications" className="flex flex-wrap gap-3">
      {choiceTags.map((choiceTag) => (
        <div
          key={choiceTag.value}
          className="inline-flex items-center justify-center rounded-sm border-2 border-gray-900 bg-blue-100 px-2 py-1 align-middle break-all text-gray-900"
        >
          <span>{choiceTag.label}</span>
          <button
            aria-label={t('gcweb:choice-tag.choice-tag-added-aria-label', { item: choiceTag.name, choice: choiceTag.label })}
            onClick={(e) => handleOnDelete(e, choiceTag)}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} className="ml-1" />
          </button>
        </div>
      ))}
    </div>
  );
}
