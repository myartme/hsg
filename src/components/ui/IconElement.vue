<template>
  <component :is="icons[name]" :class="[size, color]" />
</template>
<script setup>
import AddIcon from "@/components/ui/svg/add.svg";
import AddWithBorderIcon from "@/components/ui/svg/addWithBorder.svg";
import AlertIcon from "@/components/ui/svg/alert.svg";
import AuthorDownIcon from "@/components/ui/svg/authorDown.svg";
import AuthorUpIcon from "@/components/ui/svg/authorUp.svg";
import CheckIcon from "@/components/ui/svg/check.svg";
import CrossIcon from "@/components/ui/svg/cross.svg";
import DateDownIcon from "@/components/ui/svg/dateDown.svg";
import DateUpIcon from "@/components/ui/svg/dateUp.svg";
import DeleteIcon from "@/components/ui/svg/delete.svg";
import DifferentIcon from "@/components/ui/svg/different.svg";
import DownloadJsonIcon from "@/components/ui/svg/downloadJson.svg";
import DownloadPdfIcon from "@/components/ui/svg/downloadPdf.svg";
import EyeIcon from "@/components/ui/svg/eye.svg";
import FilterIcon from "@/components/ui/svg/filter.svg";
import FirstNightDownIcon from "@/components/ui/svg/firstNightDown.svg";
import FirstNightUpIcon from "@/components/ui/svg/firstNightUp.svg";
import ImportIcon from "@/components/ui/svg/import.svg";
import ImportFromJsonIcon from "@/components/ui/svg/importFromJson.svg";
import InfoIcon from "@/components/ui/svg/info.svg";
import NameDownIcon from "@/components/ui/svg/nameDown.svg";
import NameUpIcon from "@/components/ui/svg/nameUp.svg";
import OptionsIcon from "@/components/ui/svg/options.svg";
import OtherNightDownIcon from "@/components/ui/svg/otherNightDown.svg";
import OtherNightUpIcon from "@/components/ui/svg/otherNightUp.svg";
import SaveIcon from "@/components/ui/svg/save.svg";
import ScriptQueueDownIcon from "@/components/ui/svg/scriptQueueDown.svg";
import ScriptQueueUpIcon from "@/components/ui/svg/scriptQueueUp.svg";
import SortIcon from "@/components/ui/svg/sort.svg";
import SortWithBorderIcon from "@/components/ui/svg/sortWithBorder.svg";
import TagsIcon from "@/components/ui/svg/tags.svg";
import ToClipboardIcon from "@/components/ui/svg/toClipboard.svg";
import UndoIcon from "@/components/ui/svg/undo.svg";
import WikiIcon from "@/components/ui/svg/wiki.svg";

const props = defineProps({
  name: String,
  size: String,
  color: {
    type: String,
    default: 'fill-[color:var(--color-border)] hover:fill-[color:var(--color-text)]'
  }
})

const icons = {
  add : AddIcon,
  addWithBorder : AddWithBorderIcon,
  alert : AlertIcon,
  authorDown : AuthorDownIcon,
  authorUp: AuthorUpIcon,
  check: CheckIcon,
  cross: CrossIcon,
  dateDown: DateDownIcon,
  dateUp: DateUpIcon,
  delete: DeleteIcon,
  different: DifferentIcon,
  downloadJson: DownloadJsonIcon,
  downloadPdf: DownloadPdfIcon,
  eye: EyeIcon,
  filter: FilterIcon,
  firstNightDown: FirstNightDownIcon,
  firstNightUp: FirstNightUpIcon,
  import: ImportIcon,
  importFromJson: ImportFromJsonIcon,
  info: InfoIcon,
  nameDown: NameDownIcon,
  nameUp: NameUpIcon,
  options: OptionsIcon,
  otherNightDown: OtherNightDownIcon,
  otherNightUp: OtherNightUpIcon,
  save : SaveIcon,
  scriptQueueDown: ScriptQueueDownIcon,
  scriptQueueUp: ScriptQueueUpIcon,
  sort: SortIcon,
  sortWithBorder: SortWithBorderIcon,
  tags: TagsIcon,
  toClipboard : ToClipboardIcon,
  undo : UndoIcon,
  wiki : WikiIcon,
}
</script>