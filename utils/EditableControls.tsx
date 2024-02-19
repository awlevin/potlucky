import { IconButton } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons"

export function EditableControls({
  isEditing,
  // onSubmit,
  onEdit,
  // onCancel,
}: {
  isEditing: boolean;
  // onSubmit: () => void;
  onEdit: () => void;
  // onCancel: () => void;
}) {
  return (
    !isEditing && (
      <IconButton
        ml={2}
        size="sm"
        icon={<EditIcon />}
        onClick={onEdit}
        aria-label="edit room title"
      />
    )
  );
}