import { IconButton } from "@chakra-ui/react";
import { LuPencil } from "react-icons/lu"

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
        onClick={onEdit}
        aria-label="edit room title"
      >
        <LuPencil />
      </IconButton>
    )
  );
}