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
export type ClearGroupEventHandler = (groupName: string) => void;

export interface ChoiceTagsProps {
  choiceTags: ChoiceTag[];
  onClearAll?: ClearAllEventHandler;
  onDelete?: DeleteEventHandler;
  onClearGroup?: ClearGroupEventHandler;
}

export function ChoiceTags({ choiceTags, onClearAll, onDelete, onClearGroup }: ChoiceTagsProps) {
  const { t } = useTranslation(['gcweb']);

  const handleOnDelete = (_event: unknown, choice: ChoiceTag) => {
    if (onDelete) onDelete(choice.name, choice.label, choice.value, choice.group);
  };

  const handleOnClearAll = () => {
    if (onClearAll) onClearAll();
  };

  const handleOnClearGroup = (groupName: string) => {
    if (onClearGroup) onClearGroup(groupName);
  };

  // Group tags by their group name
  const groupedTags = choiceTags.reduce<Record<string, ChoiceTag[]>>((groups, tag) => {
    const groupName = tag.group ?? '';
    return { ...groups, [groupName]: [...(groups[groupName] ?? []), tag] };
  }, {});

  // Check if we have any grouped tags (non-empty group names)
  const hasGroups = Object.keys(groupedTags).some((groupName) => groupName !== '');

  return (
    <div id={`selected-${choiceTags[0]?.name ?? 'default'}-wrapper`} className="flex flex-col gap-3">
      {hasGroups ? (
        // Render grouped tags
        Object.entries(groupedTags).map(
          ([groupName, tags]) =>
            groupName &&
            tags.length > 0 && (
              <div key={groupName} className="flex flex-col gap-2 bg-gray-100 p-2">
                <div className="xs:flex-row xs:items-center flex flex-col justify-between gap-2">
                  <h3 className="text-lg font-semibold">{groupName}</h3>
                  {tags.length > 1 && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleOnClearGroup(groupName)}
                      className="xs:w-auto w-fit rounded-full"
                      aria-label={t('gcweb:choice-tag.clear-group-label', {
                        items: tags[0]?.name,
                        groupName,
                      })}
                    >
                      {t('gcweb:choice-tag.clear-group')}
                    </Button>
                  )}
                </div>
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
            ),
        )
      ) : (
        // Render ungrouped tags
        <div className="flex flex-wrap gap-2">
          {choiceTags.map((choiceTag) => (
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
      )}
      {choiceTags.length > 1 && (
        <div className="self-start">
          <Button variant="primary" id="clear-all-button" onClick={handleOnClearAll}>
            {t('gcweb:choice-tag.clear-all')}
          </Button>
        </div>
      )}
    </div>
  );
}
