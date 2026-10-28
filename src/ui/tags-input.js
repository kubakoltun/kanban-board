// Tag chip input widget used inside the task modal
import { modalElements } from './dom.js';
import { escapeHtml } from '../lib/format.js';

export function setupTagsInput() {
    const { tagsInput, tagsContainer } = modalElements;
    if (!tagsInput || !tagsContainer) return;

    tagsContainer.addEventListener('click', () => tagsInput.focus());
    tagsInput.addEventListener('keydown', handleTagsKeydown);
    tagsInput.addEventListener('input', handlePastedCommas);
}

function handleTagsKeydown(e) {
    const { tagsInput, tagsContainer } = modalElements;
    const value = tagsInput.value.trim();

    if (e.key === ',' || e.key === 'Enter') {
        e.preventDefault();
        if (value) {
            addTagChip(value);
            tagsInput.value = '';
        }
    }

    if (e.key === 'Backspace' && !tagsInput.value) {
        const chips = tagsContainer.querySelectorAll('.tag-chip');
        chips[chips.length - 1]?.remove();
    }
}

function handlePastedCommas() {
    const { tagsInput } = modalElements;
    const value = tagsInput.value;
    if (!value.includes(',')) return;

    const parts = value.split(',');
    parts.forEach((part, index) => {
        const trimmed = part.trim();
        if (trimmed && index < parts.length - 1) {
            addTagChip(trimmed);
        }
    });
    tagsInput.value = parts[parts.length - 1].trim();
}

export function addTagChip(tag) {
    const normalizedTag = tag.trim().toLowerCase();
    if (!normalizedTag) return;
    if (getTagsFromChips().includes(normalizedTag)) return;

    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.dataset.tag = normalizedTag;
    chip.innerHTML = `
        ${escapeHtml(normalizedTag)}
        <button type="button" class="tag-chip-remove" aria-label="Remove tag">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        </button>
    `;

    chip.querySelector('.tag-chip-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        chip.remove();
    });

    modalElements.tagsContainer.insertBefore(chip, modalElements.tagsInput);
}

export function clearTagChips() {
    const { tagsContainer, tagsInput } = modalElements;
    if (!tagsContainer) return;

    tagsContainer.querySelectorAll('.tag-chip').forEach(chip => chip.remove());
    if (tagsInput) tagsInput.value = '';
}

export function getTagsFromChips() {
    if (!modalElements.tagsContainer) return [];
    const chips = modalElements.tagsContainer.querySelectorAll('.tag-chip');
    return Array.from(chips).map(chip => chip.dataset.tag);
}
