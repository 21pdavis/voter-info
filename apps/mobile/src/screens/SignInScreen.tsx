import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSignIn, useSignUp } from "@clerk/expo";
import { colors } from "../theme";

// Combined "sign in or sign up" screen for the email + password instance.
// Flow: try to sign in; if the account doesn't exist yet, create it and run
// the email-code verification step the Clerk instance requires at sign-up.
export function SignInScreen() {
  const { signIn, errors: signInErrors, fetchStatus: signInStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpStatus } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [formError, setFormError] = useState<string | null>(null);

  const busy = signInStatus === "fetching" || signUpStatus === "fetching";

  const fieldError =
    signInErrors.fields.identifier?.message ??
    signInErrors.fields.password?.message ??
    signUpErrors.fields.emailAddress?.message ??
    signUpErrors.fields.password?.message ??
    (step === "verify" ? signUpErrors.fields.code?.message : null) ??
    formError;

  const submitCredentials = async () => {
    setFormError(null);

    const { error } = await signIn.password({ emailAddress: email, password });

    if (!error) {
      if (signIn.status === "complete") await signIn.finalize();
      else setFormError("Additional verification is required to sign in.");
      return;
    }

    // No account with this email yet -> switch to sign-up with the same creds.
    if (error.code === "form_identifier_not_found") {
      const { error: signUpError } = await signUp.password({
        emailAddress: email,
        password,
      });
      if (signUpError) {
        setFormError(signUpError.longMessage ?? signUpError.message);
        return;
      }
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(sendError.longMessage ?? sendError.message);
        return;
      }
      setStep("verify");
      return;
    }

    setFormError(error.longMessage ?? error.message);
  };

  const submitCode = async () => {
    setFormError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFormError(error.longMessage ?? error.message);
      return;
    }
    if (signUp.status === "complete") await signUp.finalize();
    else setFormError("That code didn't complete sign-up. Try again.");
  };

  const restart = async () => {
    await signUp.reset();
    setCode("");
    setFormError(null);
    setStep("credentials");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Voter Info</Text>
        <Text style={styles.subtitle}>Sign in to see who represents you</Text>
      </View>

      <View style={styles.form}>
        {step === "credentials" ? (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textFaint}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor={colors.textFaint}
            />

            <Text style={styles.hint}>
              New here? Entering an unused email creates an account.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.label}>Verification code</Text>
            <Text style={styles.hint}>We emailed a 6-digit code to {email}.</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              placeholder="123456"
              placeholderTextColor={colors.textFaint}
            />
            <Pressable
              onPress={() => signUp.verifications.sendEmailCode()}
              disabled={busy}
            >
              <Text style={styles.linkText}>Resend code</Text>
            </Pressable>
          </>
        )}

        {fieldError ? <Text style={styles.error}>{fieldError}</Text> : null}

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={step === "credentials" ? submitCredentials : submitCode}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {step === "credentials" ? "Continue" : "Verify email"}
            </Text>
          )}
        </Pressable>

        {step === "verify" ? (
          <Pressable onPress={restart} disabled={busy}>
            <Text style={styles.linkText}>Use a different email</Text>
          </Pressable>
        ) : null}

        {/* Required mount point for Clerk's bot protection on sign-up. */}
        <View nativeID="clerk-captcha" />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.navy,
    paddingTop: 64,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.sky, fontSize: 14, marginTop: 4 },
  form: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.navyMuted,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  hint: { fontSize: 12, color: colors.textFaint, marginTop: 8 },
  error: { fontSize: 13, color: colors.danger, marginTop: 14 },
  button: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  linkText: {
    color: colors.navyMuted,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
});
