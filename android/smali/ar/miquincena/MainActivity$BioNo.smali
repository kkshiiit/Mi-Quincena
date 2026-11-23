.class final Lar/miquincena/MainActivity$BioNo;
.super Ljava/lang/Object;
.source "MainActivity.java"

# interfaces
.implements Landroid/content/DialogInterface$OnClickListener;

.field final activity:Lar/miquincena/MainActivity;

.method constructor <init>(Lar/miquincena/MainActivity;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lar/miquincena/MainActivity$BioNo;->activity:Lar/miquincena/MainActivity;
    return-void
.end method

.method public onClick(Landroid/content/DialogInterface;I)V
    .locals 2
    iget-object v0, p0, Lar/miquincena/MainActivity$BioNo;->activity:Lar/miquincena/MainActivity;
    const-string v1, "window.onBio&&onBio(\'pin\')"
    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V
    return-void
.end method
