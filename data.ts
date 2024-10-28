import { GenerateRegistrationOptionsOpts } from "@simplewebauthn/server";

interface LoggedInUser {
    id: string;
    username: string;
    devices: AuthenticatorDevice[];
}


export type AuthenticatorDevice = {
    credentialID: Base64URLString;
    credentialPublicKey: Uint8Array;
    counter: number;
    transports?: AuthenticatorTransportFuture[];
};

export type Base64URLString = string;

export type AuthenticatorTransportFuture = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';

