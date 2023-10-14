function hideAlert () {
    const element = document.querySelector('.alert');
    if (element) element.parentElement.removeChild(element);
}


// type is success or error
export function showAlert (type, message) {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${message}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5_000);
}
