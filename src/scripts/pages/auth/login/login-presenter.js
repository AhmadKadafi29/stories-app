export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('getLogin: response:', response);
        this.#view.loginFailed(response.message || 'Login failed');
        return;
      }

      // Perhatikan perubahan di sini - sesuaikan dengan struktur response API
      const token = response.data?.loginResult?.token || 
                   response.data?.token || 
                   response.data?.accessToken;

      if (!token) {
        throw new Error('No access token received from server');
      }

      this.#authModel.putAccessToken(token);
      this.#view.loginSuccessfully(response.message || 'Login successful');
      
    } catch (error) {
      console.error('getLogin: error:', error);
      this.#view.loginFailed(error.message || 'Login process failed');
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}