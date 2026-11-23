.class final Lar/miquincena/MainActivity$Bio;
.super Ljava/lang/Object;
.source "MainActivity.java"

# interfaces
.implements Ljava/lang/Runnable;

# Muestra el diálogo de huella del sistema (Android 9+). Resultado: window.onBio('ok'|'pin'|'err', código).

.field final activity:Lar/miquincena/MainActivity;

.method constructor <init>(Lar/miquincena/MainActivity;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lar/miquincena/MainActivity$Bio;->activity:Lar/miquincena/MainActivity;
    return-void
.end method

.method public run()V
    .locals 6
    iget-object v0, p0, Lar/miquincena/MainActivity$Bio;->activity:Lar/miquincena/MainActivity;
    :try_start_0
    new-instance v1, Landroid/hardware/biometrics/BiometricPrompt$Builder;
    invoke-direct {v1, v0}, Landroid/hardware/biometrics/BiometricPrompt$Builder;-><init>(Landroid/content/Context;)V
    const-string v2, "Mi Quincena"
    invoke-virtual {v1, v2}, Landroid/hardware/biometrics/BiometricPrompt$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/hardware/biometrics/BiometricPrompt$Builder;
    move-result-object v1
    const-string v2, "Desbloqueá con tu huella"
    invoke-virtual {v1, v2}, Landroid/hardware/biometrics/BiometricPrompt$Builder;->setSubtitle(Ljava/lang/CharSequence;)Landroid/hardware/biometrics/BiometricPrompt$Builder;
    move-result-object v1
    invoke-virtual {v0}, Lar/miquincena/MainActivity;->getMainExecutor()Ljava/util/concurrent/Executor;
    move-result-object v3
    const-string v2, "Usar PIN"
    new-instance v4, Lar/miquincena/MainActivity$BioNo;
    invoke-direct {v4, v0}, Lar/miquincena/MainActivity$BioNo;-><init>(Lar/miquincena/MainActivity;)V
    invoke-virtual {v1, v2, v3, v4}, Landroid/hardware/biometrics/BiometricPrompt$Builder;->setNegativeButton(Ljava/lang/CharSequence;Ljava/util/concurrent/Executor;Landroid/content/DialogInterface$OnClickListener;)Landroid/hardware/biometrics/BiometricPrompt$Builder;
    move-result-object v1
    invoke-virtual {v1}, Landroid/hardware/biometrics/BiometricPrompt$Builder;->build()Landroid/hardware/biometrics/BiometricPrompt;
    move-result-object v1
    new-instance v2, Landroid/os/CancellationSignal;
    invoke-direct {v2}, Landroid/os/CancellationSignal;-><init>()V
    new-instance v4, Lar/miquincena/MainActivity$BioCb;
    invoke-direct {v4, v0}, Lar/miquincena/MainActivity$BioCb;-><init>(Lar/miquincena/MainActivity;)V
    invoke-virtual {v1, v2, v3, v4}, Landroid/hardware/biometrics/BiometricPrompt;->authenticate(Landroid/os/CancellationSignal;Ljava/util/concurrent/Executor;Landroid/hardware/biometrics/BiometricPrompt$AuthenticationCallback;)V
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0
    return-void

    :catch_0
    move-exception v1
    const-string v1, "window.onBio&&onBio(\'err\',-1)"
    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V
    return-void
.end method
