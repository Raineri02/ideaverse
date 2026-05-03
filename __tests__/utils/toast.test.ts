// Unmock toast — this test suite tests the REAL implementation
jest.unmock('../../src/utils/toast');
const { toast, registerToast } = require('../../src/utils/toast');

describe('toast utility', () => {
  it('should not throw when no handler is registered', () => {
    expect(() => toast('hello')).not.toThrow();
  });

  it('should call registered handler with message and default type', () => {
    const handler = jest.fn();
    registerToast(handler);
    toast('Projeto salvo');
    expect(handler).toHaveBeenCalledWith('Projeto salvo', 'success');
  });

  it('should call registered handler with error type', () => {
    const handler = jest.fn();
    registerToast(handler);
    toast('Algo deu errado', 'error');
    expect(handler).toHaveBeenCalledWith('Algo deu errado', 'error');
  });

  it('should call registered handler with info type', () => {
    const handler = jest.fn();
    registerToast(handler);
    toast('Dica importante', 'info');
    expect(handler).toHaveBeenCalledWith('Dica importante', 'info');
  });

  it('should replace handler when registerToast is called again', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    registerToast(handler1);
    registerToast(handler2);
    toast('msg');
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });
});
