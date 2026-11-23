.class final Lar/miquincena/MainActivity$BioCb;
.super Landroid/hardware/biometrics/BiometricPrompt$AuthenticationCallback;
.source "MainActivity.java"

.field final activity:Lar/miquincena/MainActivity;

.method constructor <init>(Lar/miquincena/MainActivity;)V
    .locals 0
    invoke-direct {p0}, Landroid/hardware/biometrics/BiometricPrompt$AuthenticationCallback;-><init>()V
    iput-object p1, p0, Lar/miquincena/MainActivity$BioCb;->activity:Lar/miquincena/MainActivity;
    return-void
.end method

.method public onAuthenticationSucceeded(Landroid/hardware/biometrics/BiometricPrompt$AuthenticationResult;)V
    .locals 2
    iget-object v0, p0, Lar/miquincena/MainActivity$BioCb;->activity:Lar/miquincena/MainActivity;
    const-string v1, "window.onBio&&onBio(\'ok\')"
    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V
    return-void
.end method

.method public onAuthenticationError(ILjava/lang/CharSequence;)V
    .locals 3
    new-instance v0, Ljava/lang/StringBuilder;
    const-string v1, "window.onBio&&onBio(\'err\',"
    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V
    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;
    const-string v1, ")"
    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v0
    iget-object v2, p0, Lar/miquincena/MainActivity$BioCb;->activity:Lar/miquincena/MainActivity;
    invoke-virtual {v2, v0}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V
    return-void
.end method
