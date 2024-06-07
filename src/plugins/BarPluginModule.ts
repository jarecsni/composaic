export interface MyCoolBarExtensionType {
    saySomethingCool(): void;
}

export interface MyCoolExtensionType {
    doSomethingCool(): void;
}

export class SimpleCoolExtensionProvider implements MyCoolBarExtensionType {
    saySomethingCool(): void {
        console.log('Saying something cool - well, default cool that is');
    }
}
