class _TabItem extends StatelessWidget {
  const _TabItem({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SmartRefzhejiaresher(
      physics: const ClampingScrollPhysics(),
      enablePullUp: true,
      enablePullDown: true,
      header: const HeaderMain(),
      footer: const FooterMain(),
      controller: RefreshController(),
      child: CustomScrollView(
        slivers: [
          if (context.watch<AgreeListModel>().isNoMore)
            SliverToBoxAdapter(
              child: NoData(),
            ),
          SliverPadding(
            sliver: SliverGrid.count(
              crossAxisCount: 1,
              mainAxisSpacing: setWidth(30),
              crossAxisSpacing: setWidth(30),
              childAspectRatio: 5,
              children: [
                for (var item in context.watch<AgreeListModel>().aggreementList)
                  AgreementItem(item: item)
              ],
            ),
             padding: EdgeInsets.symmetric(
              horizontal: setWidth(24),
              vertical: setWidth(30),
            ),
          ),
        ],
      ),
    );
  }
}


