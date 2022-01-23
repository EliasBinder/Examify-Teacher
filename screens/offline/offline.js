function offline_retry() {
    document.getElementById('offline_retry_btn').style.display = 'none';
    document.getElementById('offline_retry_loading').style.display = 'block';
    apiCall(offlineBridge['method'], offlineBridge['content'], offlineBridge['path'], offlineBridge['inBackground'], offlineBridge['callback']);
}
