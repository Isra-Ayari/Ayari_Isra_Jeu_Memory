document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (!card.classList.contains('flipped')) {
                card.classList.add('flipped');
            }
        });
    });
});
