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

  // Group tags by their group name
  const groupedTags = choiceTags.reduce<Record<string, ChoiceTag[]>>((groups, tag) => {
    const groupName = tag.group ?? '';
    return { ...groups, [groupName]: [...(groups[groupName] ?? []), tag] };
  }, {});

  return (
    <div id={`selected-${choiceTags[0]?.name ?? 'default'}-wrapper`} className="flex flex-col gap-3">
      {Object.entries(groupedTags).map(([groupName, tags]) => (
        <div key={groupName} className="flex flex-col gap-2">
          {groupName && <h3 className="text-lg font-semibold">{groupName}</h3>}
          <div className="flex flex-wrap gap-2">
            {tags.map((choiceTag) => (
              <div
                key={choiceTag.value}
                className="inline-flex items-center justify-center rounded-sm border-2 border-gray-900 bg-blue-100 px-2 py-1 align-middle break-all text-gray-900"
              >
                <span>{choiceTag.label}</span>
                <button
                  aria-label={t('gcweb:choice-tag.choice-tag-added-aria-label', {
                    item: choiceTag.name,
                    choice: choiceTag.label,
                  })}
                  onClick={(e) => handleOnDelete(e, choiceTag)}
                  type="button"
                >
                  <FontAwesomeIcon icon={faXmark} className="ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {choiceTags.length > 1 && (
        <div className="self-start">
          <Button variant="primary" id="clear-all-button" onClick={() => handleOnClearAll()}>
            {t('gcweb:choice-tag.clear-all')}
          </Button>
        </div>
      )}
    </div>
  );
}
