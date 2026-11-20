.class public final synthetic Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda1;
.super Ljava/lang/Object;
.source "D8$$SyntheticClass"

# interfaces
.implements Ljava/lang/Runnable;


# instance fields
.field public final synthetic f$0:Lar/miquincena/MainActivity$Bridge;

.field public final synthetic f$1:Z


# direct methods
.method public synthetic constructor <init>(Lar/miquincena/MainActivity$Bridge;Z)V
    .locals 0

    .line 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p1, p0, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda1;->f$0:Lar/miquincena/MainActivity$Bridge;

    iput-boolean p2, p0, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda1;->f$1:Z

    return-void
.end method


# virtual methods
.method public final run()V
    .locals 2

    .line 0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda1;->f$0:Lar/miquincena/MainActivity$Bridge;

    iget-boolean v1, p0, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda1;->f$1:Z

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity$Bridge;->lambda$8$ar-miquincena-MainActivity$Bridge(Z)V

    return-void
.end method
