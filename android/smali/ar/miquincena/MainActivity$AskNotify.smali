.class final Lar/miquincena/MainActivity$AskNotify;
.super Ljava/lang/Object;
.source "MainActivity.java"

# interfaces
.implements Ljava/lang/Runnable;

# Pide permiso de notificaciones (Android 13+) para el aviso de día de cobro.

.field final activity:Landroid/app/Activity;

.method constructor <init>(Landroid/app/Activity;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lar/miquincena/MainActivity$AskNotify;->activity:Landroid/app/Activity;
    return-void
.end method

.method public run()V
    .locals 4
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I
    const/16 v1, 0x21
    if-lt v0, v1, :done
    iget-object v0, p0, Lar/miquincena/MainActivity$AskNotify;->activity:Landroid/app/Activity;
    const-string v1, "android.permission.POST_NOTIFICATIONS"
    invoke-virtual {v0, v1}, Landroid/app/Activity;->checkSelfPermission(Ljava/lang/String;)I
    move-result v2
    if-eqz v2, :done
    filled-new-array {v1}, [Ljava/lang/String;
    move-result-object v1
    const/16 v3, 0xb
    invoke-virtual {v0, v1, v3}, Landroid/app/Activity;->requestPermissions([Ljava/lang/String;I)V
    :done
    return-void
.end method
