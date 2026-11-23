.class public Lar/miquincena/MainActivity$Bridge;
.super Ljava/lang/Object;
.source "MainActivity.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lar/miquincena/MainActivity;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x1
    name = "Bridge"
.end annotation


# static fields
.field static darkColor:I = -0xf8f3ec


# instance fields
.field final synthetic this$0:Lar/miquincena/MainActivity;


# direct methods
.method public constructor <init>(Lar/miquincena/MainActivity;)V
    .locals 0

    .line 15
    iput-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method static synthetic lambda$0(Ljava/io/File;Ljava/lang/String;)Z
    .locals 0

    .line 20
    const-string p0, ".json"

    invoke-virtual {p1, p0}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result p0

    return p0
.end method

.method static synthetic lambda$1(Ljava/io/File;Ljava/io/File;)I
    .locals 2

    .line 20
    invoke-virtual {p1}, Ljava/io/File;->lastModified()J

    move-result-wide v0

    invoke-virtual {p0}, Ljava/io/File;->lastModified()J

    move-result-wide p0

    invoke-static {v0, v1, p0, p1}, Ljava/lang/Long;->compare(JJ)I

    move-result p0

    return p0
.end method


# virtual methods
.method public backups()Ljava/lang/String;
    .locals 9
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 20
    new-instance v0, Lorg/json/JSONArray;

    invoke-direct {v0}, Lorg/json/JSONArray;-><init>()V

    new-instance v1, Ljava/io/File;

    iget-object v2, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v2}, Lar/miquincena/MainActivity;->getFilesDir()Ljava/io/File;

    move-result-object v2

    const-string v3, "backups"

    invoke-direct {v1, v2, v3}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    new-instance v2, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda6;

    invoke-direct {v2}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda6;-><init>()V

    invoke-virtual {v1, v2}, Ljava/io/File;->listFiles(Ljava/io/FilenameFilter;)[Ljava/io/File;

    move-result-object v1

    if-eqz v1, :cond_1

    new-instance v2, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda7;

    invoke-direct {v2}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda7;-><init>()V

    invoke-static {v1, v2}, Ljava/util/Arrays;->sort([Ljava/lang/Object;Ljava/util/Comparator;)V

    array-length v2, v1

    const/4 v3, 0x0

    :goto_0
    if-lt v3, v2, :cond_0

    goto :goto_2

    :cond_0
    aget-object v4, v1, v3

    :try_start_0
    new-instance v5, Lorg/json/JSONObject;

    invoke-direct {v5}, Lorg/json/JSONObject;-><init>()V

    const-string v6, "id"

    invoke-virtual {v4}, Ljava/io/File;->getName()Ljava/lang/String;

    move-result-object v7

    invoke-virtual {v5, v6, v7}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    move-result-object v5

    const-string v6, "at"

    invoke-virtual {v4}, Ljava/io/File;->lastModified()J

    move-result-wide v7

    invoke-virtual {v5, v6, v7, v8}, Lorg/json/JSONObject;->put(Ljava/lang/String;J)Lorg/json/JSONObject;

    move-result-object v4

    invoke-virtual {v0, v4}, Lorg/json/JSONArray;->put(Ljava/lang/Object;)Lorg/json/JSONArray;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_1

    :catch_0
    move-exception v4

    :goto_1
    add-int/lit8 v3, v3, 0x1

    goto :goto_0

    :cond_1
    :goto_2
    invoke-virtual {v0}, Lorg/json/JSONArray;->toString()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public cloudConnect(Z)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 28
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    new-instance v1, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda1;

    invoke-direct {v1, p0, p1}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda1;-><init>(Lar/miquincena/MainActivity$Bridge;Z)V

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method public cloudDisconnect()V
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 29
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iget-boolean v0, v0, Lar/miquincena/MainActivity;->cloudBusy:Z

    if-eqz v0, :cond_0

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v1, "Esper\u00e1 a que termine la operaci\u00f3n en curso."

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    return-void

    :cond_0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v0

    const-string v1, ""

    const-string v2, "cloud-uri"

    invoke-interface {v0, v2, v1}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v1}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v1

    invoke-interface {v1}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v1

    invoke-interface {v1, v2}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v1

    const-string v2, "cloud-name"

    invoke-interface {v1, v2}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v1

    const-string v2, "cloud-hash"

    invoke-interface {v1, v2}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v1

    const-string v2, "cloud-status"

    invoke-interface {v1, v2}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v1

    invoke-interface {v1}, Landroid/content/SharedPreferences$Editor;->apply()V

    :try_start_0
    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v1}, Lar/miquincena/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    invoke-static {v0}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v0

    const/4 v2, 0x3

    invoke-virtual {v1, v0, v2}, Landroid/content/ContentResolver;->releasePersistableUriPermission(Landroid/net/Uri;I)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    :goto_0
    return-void
.end method

.method public cloudInfo()Ljava/lang/String;
    .locals 5
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 27
    const-string v0, ""

    :try_start_0
    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "connected"

    iget-object v3, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v3}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v3

    const-string v4, "cloud-uri"

    invoke-interface {v3, v4, v0}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v3}, Ljava/lang/String;->isEmpty()Z

    move-result v3

    if-eqz v3, :cond_0

    const/4 v3, 0x0

    goto :goto_0

    :cond_0
    const/4 v3, 0x1

    :goto_0
    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    move-result-object v1

    const-string v2, "name"

    iget-object v3, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v3}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v3

    const-string v4, "cloud-name"

    invoke-interface {v3, v4, v0}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    move-result-object v1

    const-string v2, "status"

    iget-object v3, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v3}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v3

    const-string v4, "cloud-status"

    invoke-interface {v3, v4, v0}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v1, v2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    move-result-object v0

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object v0
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return-object v0

    :catch_0
    move-exception v0

    const-string v0, "{}"

    return-object v0
.end method

.method public cloudRead()V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 30
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iget-boolean v0, v0, Lar/miquincena/MainActivity;->cloudBusy:Z

    if-eqz v0, :cond_0

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v1, "Esper\u00e1 a que termine la operaci\u00f3n en curso."

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    return-void

    :cond_0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const/4 v1, 0x1

    iput-boolean v1, v0, Lar/miquincena/MainActivity;->cloudBusy:Z

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iget-object v0, v0, Lar/miquincena/MainActivity;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v1, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda9;

    invoke-direct {v1, p0}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda9;-><init>(Lar/miquincena/MainActivity$Bridge;)V

    invoke-interface {v0, v1}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    return-void
.end method

.method public cloudReplace()V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 32
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->syncCloud(Z)V

    return-void
.end method

.method public cloudSync()V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 31
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->syncCloud(Z)V

    return-void
.end method

.method public configureReminder(Ljava/lang/String;)V
    .locals 4
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 33
    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0, p1}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    const-string v1, "reminder"

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->optBoolean(Ljava/lang/String;Z)Z

    move-result v1

    const-string v2, "reminderTime"

    const-string v3, "18:00"

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    const-string v2, "([01][0-9]|2[0-3]):[0-5][0-9]"

    invoke-virtual {v0, v2}, Ljava/lang/String;->matches(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_1

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iput-object p1, v0, Lar/miquincena/MainActivity;->reminderConfig:Ljava/lang/String;

    if-eqz v1, :cond_0

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x21

    if-lt v0, v1, :cond_0

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v1, "android.permission.POST_NOTIFICATIONS"

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->checkSelfPermission(Ljava/lang/String;)I

    move-result v0

    if-eqz v0, :cond_0

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    new-instance v0, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda3;

    invoke-direct {v0, p0}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda3;-><init>(Lar/miquincena/MainActivity$Bridge;)V

    invoke-virtual {p1, v0}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void

    :cond_0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v0, p1}, Lar/miquincena/MainActivity;->applyReminder(Ljava/lang/String;)V

    goto :goto_0

    :cond_1
    new-instance p1, Ljava/io/IOException;

    invoke-direct {p1}, Ljava/io/IOException;-><init>()V

    throw p1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    :catch_0
    move-exception p1

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v0, "No se pudo configurar el recordatorio."

    invoke-virtual {p1, v0}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method public copyText(Ljava/lang/String;)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 26
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    new-instance v1, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda2;

    invoke-direct {v1, p0, p1}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda2;-><init>(Lar/miquincena/MainActivity$Bridge;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method public exportFile(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 23
    :try_start_0
    invoke-virtual {p3}, Ljava/lang/String;->length()I

    move-result v0

    const/high16 v1, 0xf00000

    if-gt v0, v1, :cond_0

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const/4 v1, 0x0

    invoke-static {p3, v1}, Landroid/util/Base64;->decode(Ljava/lang/String;I)[B

    move-result-object p3

    iput-object p3, v0, Lar/miquincena/MainActivity;->pending:[B

    iget-object p3, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v0, "[^a-zA-Z0-9._-]"

    const-string v1, "_"

    invoke-virtual {p1, v0, v1}, Ljava/lang/String;->replaceAll(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    iput-object p1, p3, Lar/miquincena/MainActivity;->pendingName:Ljava/lang/String;

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iput-object p2, p1, Lar/miquincena/MainActivity;->pendingMime:Ljava/lang/String;

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    new-instance p2, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda0;

    invoke-direct {p2, p0}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda0;-><init>(Lar/miquincena/MainActivity$Bridge;)V

    invoke-virtual {p1, p2}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    goto :goto_0

    :cond_0
    new-instance p1, Ljava/io/IOException;

    invoke-direct {p1}, Ljava/io/IOException;-><init>()V

    throw p1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    :catch_0
    move-exception p1

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string p2, "No se pudo preparar el archivo"

    invoke-virtual {p1, p2}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method public importFile()V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 24
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    new-instance v1, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda5;

    invoke-direct {v1, p0}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda5;-><init>(Lar/miquincena/MainActivity$Bridge;)V

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method synthetic lambda$10$ar-miquincena-MainActivity$Bridge()V
    .locals 3

    .line 33
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v1, "android.permission.POST_NOTIFICATIONS"

    filled-new-array {v1}, [Ljava/lang/String;

    move-result-object v1

    const/16 v2, 0xa

    invoke-virtual {v0, v1, v2}, Lar/miquincena/MainActivity;->requestPermissions([Ljava/lang/String;I)V

    return-void
.end method

.method synthetic lambda$2$ar-miquincena-MainActivity$Bridge(Z)V
    .locals 2

    .line 22
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iget-boolean v0, v0, Lar/miquincena/MainActivity;->destroyed:Z

    if-eqz v0, :cond_0

    return-void

    :cond_0
    if-eqz p1, :cond_1

    sget v0, Lar/miquincena/MainActivity$Bridge;->darkColor:I

    goto :goto_0

    :cond_1
    const v0, -0x16110a

    :goto_0
    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v1}, Lar/miquincena/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v1

    invoke-virtual {v1, v0}, Landroid/view/Window;->setStatusBarColor(I)V

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v1}, Lar/miquincena/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v1

    invoke-virtual {v1, v0}, Landroid/view/Window;->setNavigationBarColor(I)V

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v1}, Lar/miquincena/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v1

    invoke-virtual {v1}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object v1

    if-eqz p1, :cond_2

    const/4 p1, 0x0

    goto :goto_1

    :cond_2
    const/16 p1, 0x2010

    :goto_1
    invoke-virtual {v1, p1}, Landroid/view/View;->setSystemUiVisibility(I)V

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iget-object p1, p1, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {p1, v0}, Landroid/webkit/WebView;->setBackgroundColor(I)V

    return-void
.end method

.method synthetic lambda$3$ar-miquincena-MainActivity$Bridge()V
    .locals 3

    .line 23
    new-instance v0, Landroid/app/AlertDialog$Builder;

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-direct {v0, v1}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V

    const-string v1, "Exportar archivo"

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    move-result-object v0

    const-string v1, "Guardar en Archivos o Drive"

    const-string v2, "Compartir archivo"

    filled-new-array {v1, v2}, [Ljava/lang/String;

    move-result-object v1

    new-instance v2, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda4;

    invoke-direct {v2, p0}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda4;-><init>(Lar/miquincena/MainActivity$Bridge;)V

    invoke-virtual {v0, v1, v2}, Landroid/app/AlertDialog$Builder;->setItems([Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    move-result-object v0

    const-string v1, "Cancelar"

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    move-result-object v0

    invoke-virtual {v0}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;

    return-void
.end method

.method synthetic lambda$4$ar-miquincena-MainActivity$Bridge(Landroid/content/DialogInterface;I)V
    .locals 1

    .line 23
    if-nez p2, :cond_0

    :try_start_0
    new-instance p1, Landroid/content/Intent;

    const-string p2, "android.intent.action.CREATE_DOCUMENT"

    invoke-direct {p1, p2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    iget-object p2, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iget-object p2, p2, Lar/miquincena/MainActivity;->pendingMime:Ljava/lang/String;

    invoke-virtual {p1, p2}, Landroid/content/Intent;->setType(Ljava/lang/String;)Landroid/content/Intent;

    move-result-object p1

    const-string p2, "android.intent.category.OPENABLE"

    invoke-virtual {p1, p2}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    move-result-object p1

    const-string p2, "android.intent.extra.TITLE"

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iget-object v0, v0, Lar/miquincena/MainActivity;->pendingName:Ljava/lang/String;

    invoke-virtual {p1, p2, v0}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    move-result-object p1

    iget-object p2, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const/4 v0, 0x2

    invoke-virtual {p2, p1, v0}, Lar/miquincena/MainActivity;->startActivityForResult(Landroid/content/Intent;I)V

    goto :goto_0

    :cond_0
    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {p1}, Lar/miquincena/MainActivity;->share()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string p2, "No hay una app disponible para este archivo."

    invoke-virtual {p1, p2}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method synthetic lambda$5$ar-miquincena-MainActivity$Bridge()V
    .locals 4

    .line 24
    :try_start_0
    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.OPEN_DOCUMENT"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "*/*"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->setType(Ljava/lang/String;)Landroid/content/Intent;

    move-result-object v0

    const-string v1, "android.intent.category.OPENABLE"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    move-result-object v0

    const-string v1, "android.intent.extra.MIME_TYPES"

    const-string v2, "application/json"

    const-string v3, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    filled-new-array {v2, v3}, [Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;[Ljava/lang/String;)Landroid/content/Intent;

    move-result-object v0

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const/4 v2, 0x3

    invoke-virtual {v1, v0, v2}, Lar/miquincena/MainActivity;->startActivityForResult(Landroid/content/Intent;I)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v1, "No se encontr\u00f3 un selector de archivos."

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method synthetic lambda$6$ar-miquincena-MainActivity$Bridge(Ljava/lang/String;)V
    .locals 2

    .line 25
    :try_start_0
    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.SEND"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "text/plain"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->setType(Ljava/lang/String;)Landroid/content/Intent;

    move-result-object v0

    const-string v1, "android.intent.extra.TEXT"

    invoke-virtual {v0, v1, p1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    move-result-object p1

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v1, "Compartir resumen"

    invoke-static {p1, v1}, Landroid/content/Intent;->createChooser(Landroid/content/Intent;Ljava/lang/CharSequence;)Landroid/content/Intent;

    move-result-object p1

    invoke-virtual {v0, p1}, Lar/miquincena/MainActivity;->startActivity(Landroid/content/Intent;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v0, "No se pudo abrir Compartir."

    invoke-virtual {p1, v0}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method synthetic lambda$7$ar-miquincena-MainActivity$Bridge(Ljava/lang/String;)V
    .locals 2

    .line 26
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v1, "clipboard"

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/content/ClipboardManager;

    const-string v1, "Mi Quincena"

    invoke-static {v1, p1}, Landroid/content/ClipData;->newPlainText(Ljava/lang/CharSequence;Ljava/lang/CharSequence;)Landroid/content/ClipData;

    move-result-object p1

    invoke-virtual {v0, p1}, Landroid/content/ClipboardManager;->setPrimaryClip(Landroid/content/ClipData;)V

    return-void
.end method

.method synthetic lambda$8$ar-miquincena-MainActivity$Bridge(Z)V
    .locals 3

    .line 28
    :try_start_0
    new-instance v0, Landroid/content/Intent;

    if-eqz p1, :cond_0

    const-string v1, "android.intent.action.CREATE_DOCUMENT"

    goto :goto_0

    :cond_0
    const-string v1, "android.intent.action.OPEN_DOCUMENT"

    :goto_0
    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "application/json"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->setType(Ljava/lang/String;)Landroid/content/Intent;

    move-result-object v0

    const-string v1, "android.intent.category.OPENABLE"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    move-result-object v0

    const/16 v1, 0x43

    invoke-virtual {v0, v1}, Landroid/content/Intent;->addFlags(I)Landroid/content/Intent;

    move-result-object v0

    if-eqz p1, :cond_1

    const-string v1, "android.intent.extra.TITLE"

    const-string v2, "Mi-Quincena-respaldo.json"

    invoke-virtual {v0, v1, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    :cond_1
    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    if-eqz p1, :cond_2

    const/4 p1, 0x4

    goto :goto_1

    :cond_2
    const/4 p1, 0x5

    :goto_1
    invoke-virtual {v1, v0, p1}, Lar/miquincena/MainActivity;->startActivityForResult(Landroid/content/Intent;I)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_2

    :catch_0
    move-exception p1

    iget-object p1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v0, "No hay proveedor de archivos disponible."

    invoke-virtual {p1, v0}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :goto_2
    return-void
.end method

.method synthetic lambda$9$ar-miquincena-MainActivity$Bridge()V
    .locals 5

    .line 30
    :try_start_0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v0

    const-string v1, "cloud-uri"

    const-string v2, ""

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v1

    if-nez v1, :cond_0

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    iget-object v2, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v2}, Lar/miquincena/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v2

    invoke-static {v0}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v0

    invoke-virtual {v2, v0}, Landroid/content/ContentResolver;->openInputStream(Landroid/net/Uri;)Ljava/io/InputStream;

    move-result-object v0

    const/high16 v2, 0xa00000

    invoke-virtual {v1, v0, v2}, Lar/miquincena/MainActivity;->read(Ljava/io/InputStream;I)[B

    move-result-object v0

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "window.onCloudRead&&onCloudRead("

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    new-instance v3, Ljava/lang/String;

    sget-object v4, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-direct {v3, v0, v4}, Ljava/lang/String;-><init>([BLjava/nio/charset/Charset;)V

    invoke-static {v3}, Lorg/json/JSONObject;->quote(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v2, ")"

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v1, v0}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V

    goto :goto_0

    :cond_0
    new-instance v0, Ljava/io/IOException;

    invoke-direct {v0}, Ljava/io/IOException;-><init>()V

    throw v0
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    :catchall_0
    move-exception v0

    goto :goto_1

    :catch_0
    move-exception v0

    :try_start_1
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    const-string v1, "No se pudo leer el respaldo. Revis\u00e1 la conexi\u00f3n y el acceso al archivo."

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->cloudStatus(Ljava/lang/String;)V
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    :goto_0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v0}, Lar/miquincena/MainActivity;->finishCloud()V

    return-void

    :goto_1
    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v1}, Lar/miquincena/MainActivity;->finishCloud()V

    throw v0
.end method

.method public declared-synchronized load()Ljava/lang/String;
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    monitor-enter p0

    .line 16
    :try_start_0
    new-instance v0, Ljava/io/File;

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v1}, Lar/miquincena/MainActivity;->getFilesDir()Ljava/io/File;

    move-result-object v1

    const-string v2, "state.json"

    invoke-direct {v0, v1, v2}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-virtual {v0}, Ljava/io/File;->exists()Z

    move-result v1

    if-nez v1, :cond_0

    const-string v0, ""
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    :goto_0
    monitor-exit p0

    return-object v0

    :cond_0
    :try_start_1
    new-instance v1, Ljava/lang/String;

    new-instance v2, Landroid/util/AtomicFile;

    invoke-direct {v2, v0}, Landroid/util/AtomicFile;-><init>(Ljava/io/File;)V

    invoke-virtual {v2}, Landroid/util/AtomicFile;->readFully()[B

    move-result-object v0

    sget-object v2, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-direct {v1, v0, v2}, Ljava/lang/String;-><init>([BLjava/nio/charset/Charset;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    monitor-exit p0

    return-object v1

    :catch_0
    move-exception v0

    :try_start_2
    const-string v0, "INVALID"
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    goto :goto_0

    .line 16
    :catchall_0
    move-exception v0

    monitor-exit p0

    throw v0
.end method

.method public preference(Ljava/lang/String;)Ljava/lang/String;
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 18
    const-string v0, "draft-row"

    const-string v1, "welcome-v2"

    filled-new-array {v0, v1}, [Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Ljava/util/Arrays;->asList([Ljava/lang/Object;)Ljava/util/List;

    move-result-object v0

    invoke-interface {v0, p1}, Ljava/util/List;->contains(Ljava/lang/Object;)Z

    move-result v0

    const-string v1, ""

    if-nez v0, :cond_0

    return-object v1

    :cond_0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v0

    invoke-interface {v0, p1, v1}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    return-object p1
.end method

.method public preferenceSave(Ljava/lang/String;Ljava/lang/String;)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 19
    const-string v0, "draft-row"

    const-string v1, "welcome-v2"

    filled-new-array {v0, v1}, [Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Ljava/util/Arrays;->asList([Ljava/lang/Object;)Ljava/util/List;

    move-result-object v0

    invoke-interface {v0, p1}, Ljava/util/List;->contains(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-virtual {p2}, Ljava/lang/String;->length()I

    move-result v0

    const/16 v1, 0x7530

    if-ge v0, v1, :cond_0

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0, p1, p2}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object p1

    invoke-interface {p1}, Landroid/content/SharedPreferences$Editor;->apply()V

    :cond_0
    return-void
.end method

.method public readBackup(Ljava/lang/String;)Ljava/lang/String;
    .locals 7
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 21
    const-string v0, "[0-9]+-[a-z0-9]+\\.json"

    invoke-virtual {p1, v0}, Ljava/lang/String;->matches(Ljava/lang/String;)Z

    move-result v0

    const-string v1, ""

    if-nez v0, :cond_0

    return-object v1

    :cond_0
    :try_start_0
    new-instance v0, Ljava/lang/String;

    new-instance v2, Landroid/util/AtomicFile;

    new-instance v3, Ljava/io/File;

    new-instance v4, Ljava/io/File;

    iget-object v5, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v5}, Lar/miquincena/MainActivity;->getFilesDir()Ljava/io/File;

    move-result-object v5

    const-string v6, "backups"

    invoke-direct {v4, v5, v6}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-direct {v3, v4, p1}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-direct {v2, v3}, Landroid/util/AtomicFile;-><init>(Ljava/io/File;)V

    invoke-virtual {v2}, Landroid/util/AtomicFile;->readFully()[B

    move-result-object p1

    sget-object v2, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-direct {v0, p1, v2}, Ljava/lang/String;-><init>([BLjava/nio/charset/Charset;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return-object v0

    :catch_0
    move-exception p1

    return-object v1
.end method

.method public declared-synchronized save(Ljava/lang/String;)Ljava/lang/String;
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    monitor-enter p0

    .line 17
    :try_start_0
    sget-object v0, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-virtual {p1, v0}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object v0

    array-length v0, v0

    const/high16 v1, 0xa00000

    if-gt v0, v1, :cond_3

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0, p1}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    const-string v1, "rows"

    invoke-virtual {v0, v1}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_2

    const-string v1, "payments"

    invoke-virtual {v0, v1}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_2

    const-string v1, "rules"

    invoke-virtual {v0, v1}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_2

    new-instance v0, Ljava/io/File;

    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v1}, Lar/miquincena/MainActivity;->getFilesDir()Ljava/io/File;

    move-result-object v1

    const-string v2, "state.json"

    invoke-direct {v0, v1, v2}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-virtual {v0}, Ljava/io/File;->exists()Z

    move-result v1

    if-eqz v1, :cond_1

    new-instance v1, Landroid/util/AtomicFile;

    invoke-direct {v1, v0}, Landroid/util/AtomicFile;-><init>(Ljava/io/File;)V

    invoke-virtual {v1}, Landroid/util/AtomicFile;->readFully()[B

    move-result-object v1

    sget-object v2, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-virtual {p1, v2}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object v2

    invoke-static {v1, v2}, Ljava/util/Arrays;->equals([B[B)Z

    move-result v2
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    if-eqz v2, :cond_0

    :goto_0
    :try_start_1
    const-string p1, "ok"
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    :goto_1
    monitor-exit p0

    return-object p1

    :cond_0
    :try_start_2
    iget-object v2, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    invoke-virtual {v2, v1}, Lar/miquincena/MainActivity;->snapshot([B)V

    :cond_1
    iget-object v1, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    sget-object v2, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-virtual {p1, v2}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object p1

    invoke-virtual {v1, v0, p1}, Lar/miquincena/MainActivity;->writeAtomic(Ljava/io/File;[B)V

    goto :goto_0

    :cond_2
    new-instance p1, Ljava/io/IOException;

    invoke-direct {p1}, Ljava/io/IOException;-><init>()V

    :goto_2
    throw p1

    :cond_3
    new-instance p1, Ljava/io/IOException;

    invoke-direct {p1}, Ljava/io/IOException;-><init>()V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_0
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    goto :goto_2

    .line 17
    :catchall_0
    move-exception p1

    goto :goto_3

    .line 17
    :catch_0
    move-exception p1

    :try_start_3
    const-string p1, "No se pudo guardar. Revis\u00e1 el espacio disponible. Tus datos anteriores se conservan."
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_0

    goto :goto_1

    .line 17
    :goto_3
    monitor-exit p0

    throw p1
.end method

.method public setTheme(Z)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 22
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    new-instance v1, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda8;

    invoke-direct {v1, p0, p1}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda8;-><init>(Lar/miquincena/MainActivity$Bridge;Z)V

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method public shareText(Ljava/lang/String;)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 25
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;

    new-instance v1, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda10;

    invoke-direct {v1, p0, p1}, Lar/miquincena/MainActivity$Bridge$$ExternalSyntheticLambda10;-><init>(Lar/miquincena/MainActivity$Bridge;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method public setDarkColor(I)V
    .locals 0
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    sput p1, Lar/miquincena/MainActivity$Bridge;->darkColor:I

    return-void
.end method

.method public setSecure(Z)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;
    new-instance v1, Lar/miquincena/MainActivity$Secure;
    invoke-direct {v1, v0, p1}, Lar/miquincena/MainActivity$Secure;-><init>(Landroid/app/Activity;Z)V
    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V
    return-void
.end method

.method public setPayday(Ljava/lang/String;)V
    .locals 4
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;
    invoke-virtual {v0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;
    move-result-object v1
    invoke-interface {v1}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;
    move-result-object v1
    const-string v2, "payday-config"
    invoke-interface {v1, v2, p1}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;
    move-result-object v1
    invoke-interface {v1}, Landroid/content/SharedPreferences$Editor;->commit()Z
    invoke-static {v0}, Lar/miquincena/ReminderService;->schedule(Landroid/content/Context;)V
    new-instance v1, Lorg/json/JSONObject;
    invoke-direct {v1, p1}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V
    const-string v2, "enabled"
    const/4 v3, 0x0
    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->optBoolean(Ljava/lang/String;Z)Z
    move-result v1
    if-eqz v1, :done
    new-instance v1, Lar/miquincena/MainActivity$AskNotify;
    invoke-direct {v1, v0}, Lar/miquincena/MainActivity$AskNotify;-><init>(Landroid/app/Activity;)V
    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0
    :done
    :catch_0
    return-void
.end method

.method public bioAvailable()Z
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I
    const/16 v1, 0x1d
    if-lt v0, v1, :no
    :try_start_0
    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;
    const-class v1, Landroid/hardware/biometrics/BiometricManager;
    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->getSystemService(Ljava/lang/Class;)Ljava/lang/Object;
    move-result-object v0
    check-cast v0, Landroid/hardware/biometrics/BiometricManager;
    if-eqz v0, :no
    invoke-virtual {v0}, Landroid/hardware/biometrics/BiometricManager;->canAuthenticate()I
    move-result v0
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0
    if-nez v0, :no
    const/4 v0, 0x1
    return v0
    :catch_0
    :no
    const/4 v0, 0x0
    return v0
.end method

.method public bioAuth()V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    iget-object v0, p0, Lar/miquincena/MainActivity$Bridge;->this$0:Lar/miquincena/MainActivity;
    new-instance v1, Lar/miquincena/MainActivity$Bio;
    invoke-direct {v1, v0}, Lar/miquincena/MainActivity$Bio;-><init>(Lar/miquincena/MainActivity;)V
    invoke-virtual {v0, v1}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V
    return-void
.end method

