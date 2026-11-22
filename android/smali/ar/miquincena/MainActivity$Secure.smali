.class final Lar/miquincena/MainActivity$Secure;
.super Ljava/lang/Object;
.source "MainActivity.java"

# interfaces
.implements Ljava/lang/Runnable;

# Activa o quita FLAG_SECURE (oculta la app en recientes y bloquea capturas).

.field final activity:Landroid/app/Activity;
.field final on:Z

.method constructor <init>(Landroid/app/Activity;Z)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lar/miquincena/MainActivity$Secure;->activity:Landroid/app/Activity;
    iput-boolean p2, p0, Lar/miquincena/MainActivity$Secure;->on:Z
    return-void
.end method

.method public run()V
    .locals 3
    iget-object v0, p0, Lar/miquincena/MainActivity$Secure;->activity:Landroid/app/Activity;
    invoke-virtual {v0}, Landroid/app/Activity;->getWindow()Landroid/view/Window;
    move-result-object v0
    const/16 v1, 0x2000
    iget-boolean v2, p0, Lar/miquincena/MainActivity$Secure;->on:Z
    if-eqz v2, :off
    invoke-virtual {v0, v1}, Landroid/view/Window;->addFlags(I)V
    return-void
    :off
    invoke-virtual {v0, v1}, Landroid/view/Window;->clearFlags(I)V
    return-void
.end method
